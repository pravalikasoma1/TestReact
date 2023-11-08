/**
 * Rhybus sharepoint publishing tool. Replaces SPGo.
 * What this script does:
 * first prepare the publishing artifacts:
 * clear existing publish folder
 * copy master pages to publish
 * copy site pages to publish
 * copy build to publish

 * now that artifacts are ready, publish them to sharepoint:
 * read site url from .env
 * authenticate pnpjs with client cert
 * publish files to sharepoint as a batch
 */
import { sp } from '@pnp/sp-commonjs'
import pnpnode from '@pnp/nodejs-commonjs'
import fs from 'fs'
import path from 'path'
import walk from 'walk'
const { MsalFetchClient } = pnpnode

const baseUrl = 'https://ideaentity.sharepoint.com/teams/hughdev'
const keyPath = path.join('..', 'cert', 'my_sharepoint.key')
const bldDir = path.join('.', 'build') // $/SiteAssets
const masterDir = path.join('.', 'src', 'sharepoint', 'masterpage') // $/_catalogs/masterpage/foo.master
const pagesDir = path.join('.', 'src', 'sharepoint', 'SitePages') // $/SitePages
const pubDir = path.join('.', 'publish')

//utility stuff
String.prototype.trimLeft = function(charlist) {
    if (charlist === undefined)
        charlist = "\s";
    return this.replace(new RegExp("^[" + charlist + "]+"), "");
};
async function runPromisesSequentially(promises) {
    if (promises.length === 0) return [];
    const [firstElement, ...rest] = promises;
    return [await firstElement, ...(await runPromisesSequentially(rest))];
}



// prepare
fs.rmSync(pubDir, { recursive: true, force: true })
fs.cpSync(masterDir, path.join(pubDir, 'masterpage'), { recursive: true })
fs.cpSync(pagesDir, path.join(pubDir, 'SitePages'), { recursive: true })
fs.cpSync(bldDir, path.join(pubDir, 'SiteAssets'), { recursive: true })

// publish
// read in our private key
const buffer = fs.readFileSync(keyPath)

// create a fetch client that authenticates with AAD using our cert
const client = new MsalFetchClient({
    auth: {
        authority: 'https://login.microsoftonline.com/c446b894-46a2-41cf-a915-ad360f8e18a8/',
        clientCertificate: {
            thumbprint: 'AA336F2F28C9E89FEB668E28CE0CDAEF1CFE4012',
            privateKey: buffer.toString()
        },
        clientId: 'dac6f2f9-01ab-42cb-9c32-2f16b1e4a40c'
    }
}, ['https://ideaentity.sharepoint.com/.default'])

// setup pnpjs with the authenticated fetch client
sp.setup({
    sp: {
        baseUrl,
        fetchClientFactory: () => client
    }
})

// publish SiteAssets
const siteAssets = await sp.web.folders.getByName('SiteAssets');

function stripRoots(path, dir) {
    return path.replace(`publish\\`, '').replace(/\\/g, '/').trimLeft('/');
}

function attempt() {
    // use the walker to generate a list of files and directories
    const directories = [];
    const files = [];
    const walker = walk.walk(path.join(pubDir, 'SiteAssets'), { followLinks: false });
    const tasks = [];

    walker.on('directories', function(root, dirStatsArray, next) {
        dirStatsArray.forEach(element => {
            // create the directory in sharepoint
            let spname = (stripRoots(root, 'SiteAssets') + '/' + element.name).trimLeft('/');
            directories.push(spname);
            console.log('d|' + spname)
            tasks.push(sp.web.folders.addUsingPath(spname, true))
        });
        next();
    });
    walker.on('file', function(root, fileStats, next) {
        let spname = (stripRoots(root, 'SiteAssets') + '/' + fileStats.name).trimLeft('/')
        files.push(spname);
        // upload the file to sharepoint
        console.log('f|' + spname);
        next();
    });

    walker.on('end', async function() {
        //console.log(directories);
        //console.log(files);


    });
}

let success = false;
let attempts = 0;
while (!success) {
    try {
        attempts++;
        attempt();
        success = true;
    } catch (error) {
        console.log(`error on attempt ${attempts}`)
    }
}

console.log('now')

//create all the folders first
//console.log(await siteAssets.folders())
// console.log(siteAssets);