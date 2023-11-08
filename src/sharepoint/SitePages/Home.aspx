<%-- _lcid="1033" _dal="1" --%>
    <%-- _LocalBinding --%>
        <%@ Page language="C#" MasterPageFile="../_catalogs/masterpage/Reactmaster.master"
            Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage,Microsoft.SharePoint,Version=16.0.0.0,Culture=neutral,PublicKeyToken=71e9bce111e9429c"
            meta:progid="SharePoint.WebPartPage.Document" %>
            <%@ Register Tagprefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls"
                Assembly="Microsoft.SharePoint, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
                <%@ Register Tagprefix="Utilities" Namespace="Microsoft.SharePoint.Utilities"
                    Assembly="Microsoft.SharePoint, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c"
                    %>
                    <%@ Import Namespace="Microsoft.SharePoint" %>
                        <%@ Assembly
                            Name="Microsoft.Web.CommandUI, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c"
                            %>
                            <%@ Register Tagprefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages"
                                Assembly="Microsoft.SharePoint, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c"
                                %>
                                <asp:Content ContentPlaceHolderId="PlaceHolderPageTitle" runat="server">
                                    <SharePoint:ListItemProperty Property="BaseName" maxlength="40" runat="server"
                                        __designer:Preview=""
                                        __designer:Values="&lt;P N=&#39;Property&#39; T=&#39;BaseName&#39; /&gt;&lt;P N=&#39;MaxLength&#39; T=&#39;40&#39; /&gt;&lt;P N=&#39;ID&#39; ID=&#39;1&#39; T=&#39;ctl00&#39; /&gt;&lt;P N=&#39;Page&#39; ID=&#39;2&#39; /&gt;&lt;P N=&#39;TemplateControl&#39; R=&#39;2&#39; /&gt;&lt;P N=&#39;AppRelativeTemplateSourceDirectory&#39; R=&#39;-1&#39; /&gt;" />
                                </asp:Content>
                                <asp:Content ContentPlaceHolderId="PlaceHolderAdditionalPageHead" runat="server">
                                    <meta name="GENERATOR" content="Microsoft SharePoint" />
                                    <meta name="ProgId" content="SharePoint.WebPartPage.Document" />
                                    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                                    <meta name="CollaborationServer" content="SharePoint Team Web Site" />
                                    <SharePoint:ScriptBlock runat="server" __designer:Preview="&lt;script type=&quot;text/javascript&quot;&gt;// &lt;![CDATA[ 


                                        var navBarHelpOverrideKey = &quot;WSSEndUser&quot;;
                                    // ]]&gt;
&lt;/script&gt;" __designer:Values="&lt;P N=&#39;ID&#39; ID=&#39;1&#39; T=&#39;ctl01&#39; /&gt;&lt;P N=&#39;Page&#39; ID=&#39;2&#39; /&gt;&lt;P N=&#39;TemplateControl&#39; R=&#39;2&#39; /&gt;&lt;P N=&#39;AppRelativeTemplateSourceDirectory&#39; R=&#39;-1&#39; /&gt;">
                                        var navBarHelpOverrideKey = "WSSEndUser";
                                    </SharePoint:ScriptBlock>
                                    <SharePoint:StyleBlock runat="server" __designer:Preview="&lt;style type=&quot;text/css&quot;&gt;
                                        body #s4-leftpanel { display:none; } .s4-ca { margin-left:0px; } /*RhyBus Listview*/
                                    &lt;/style&gt;"
                                        __designer:Values="&lt;P N=&#39;ID&#39; ID=&#39;1&#39; T=&#39;ctl02&#39; /&gt;&lt;P N=&#39;Page&#39; ID=&#39;2&#39; /&gt;&lt;P N=&#39;TemplateControl&#39; R=&#39;2&#39; /&gt;&lt;P N=&#39;AppRelativeTemplateSourceDirectory&#39; R=&#39;-1&#39; /&gt;">
                                        body #s4-leftpanel { display:none; } .s4-ca { margin-left:0px; } /*RhyBus
                                        Listview*/
                                    </SharePoint:StyleBlock>


                                    <link rel="stylesheet" href="../SiteAssets/static/css/main.chunk.css" />
                                </asp:Content>
                                <asp:Content ContentPlaceHolderId="PlaceHolderSearchArea" runat="server">
                                    <SharePoint:FlightedContent runat="server"
                                        ExpFeature="Reserved_Server_ExpFeature30731" RenderIfInFlight="true"
                                        __designer:Preview="
                                        
                                        
                                            
                                        
                                    "
                                        __designer:Values="&lt;P N=&#39;ID&#39; ID=&#39;1&#39; T=&#39;ctl07&#39; /&gt;&lt;P N=&#39;ExpFeature&#39; T=&#39;Reserved_Server_ExpFeature30731&#39; /&gt;&lt;P N=&#39;RenderIfInFlight&#39; T=&#39;True&#39; /&gt;&lt;P N=&#39;Visible&#39; T=&#39;True&#39; /&gt;&lt;P N=&#39;Page&#39; ID=&#39;2&#39; /&gt;&lt;P N=&#39;TemplateControl&#39; R=&#39;2&#39; /&gt;&lt;P N=&#39;AppRelativeTemplateSourceDirectory&#39; R=&#39;-1&#39; /&gt;">
                                        <SharePoint:SearchInNavBarEnabledContent runat="server" RenderIfEnabled="false">
                                            <SharePoint:DelegateControl runat="server"
                                                ControlId="SmallSearchInputBox" />
                                        </Sharepoint:SearchInNavBarEnabledContent>
                                        <SharePoint:SearchInNavBarEnabledContent runat="server" RenderIfEnabled="true">
                                            <SharePoint:WebTemplateBasedContent runat="server"
                                                WebTemplates="STS|BLANKINTERNET|CMSPUBLISHING|GROUP"
                                                RenderIfInWebTemplates="false">
                                                <SharePoint:DelegateControl runat="server"
                                                    ControlId="SmallSearchInputBox" />
                                            </SharePoint:WebTemplateBasedContent>
                                        </Sharepoint:SearchInNavBarEnabledContent>
                                    </SharePoint:FlightedContent>
                                    <SharePoint:FlightedContent runat="server"
                                        ExpFeature="Reserved_Server_ExpFeature30731" RenderIfInFlight="false"
                                        __designer:Preview="[ FlightedContent &quot;Unnamed9&quot; ]"
                                        __designer:Values="&lt;P N=&#39;ID&#39; ID=&#39;1&#39; T=&#39;ctl08&#39; /&gt;&lt;P N=&#39;ExpFeature&#39; T=&#39;Reserved_Server_ExpFeature30731&#39; /&gt;&lt;P N=&#39;Page&#39; ID=&#39;2&#39; /&gt;&lt;P N=&#39;TemplateControl&#39; R=&#39;2&#39; /&gt;&lt;P N=&#39;AppRelativeTemplateSourceDirectory&#39; R=&#39;-1&#39; /&gt;">
                                        <SharePoint:DelegateControl runat="server" ControlId="SmallSearchInputBox" />
                                    </SharePoint:FlightedContent>
                                </asp:Content>
                                <asp:Content ContentPlaceHolderId="PlaceHolderPageDescription" runat="server">
                                    <SharePoint:ProjectProperty Property="Description" runat="server"
                                        __designer:Preview=""
                                        __designer:Values="&lt;P N=&#39;Property&#39; T=&#39;Description&#39; /&gt;&lt;P N=&#39;ID&#39; ID=&#39;1&#39; T=&#39;ctl09&#39; /&gt;&lt;P N=&#39;Page&#39; ID=&#39;2&#39; /&gt;&lt;P N=&#39;TemplateControl&#39; R=&#39;2&#39; /&gt;&lt;P N=&#39;AppRelativeTemplateSourceDirectory&#39; R=&#39;-1&#39; /&gt;" />
                                </asp:Content>
                                <asp:Content ContentPlaceHolderId="PlaceHolderMain" runat="server">
                                    <div class="ms-hide">
                                        <WebPartPages:WebPartZone runat="server" title="loc:TitleBar" id="TitleBar"
                                            AllowLayoutChange="false" AllowPersonalization="false" Style="display:none;"
                                            __designer:Preview="&lt;Regions&gt;&lt;Region Name=&quot;0&quot; Editable=&quot;True&quot; Content=&quot;&quot; NamingContainer=&quot;True&quot; /&gt;&lt;/Regions&gt;&lt;table cellspacing=&quot;0&quot; cellpadding=&quot;0&quot; border=&quot;0&quot; id=&quot;TitleBar&quot; style=&quot;display:none;&quot;&gt;
	&lt;tr&gt;
		&lt;td style=&quot;white-space:nowrap;&quot;&gt;&lt;table cellspacing=&quot;0&quot; cellpadding=&quot;2&quot; border=&quot;0&quot; style=&quot;width:100%;&quot;&gt;
			&lt;tr&gt;
				&lt;td style=&quot;white-space:nowrap;&quot;&gt;Title Bar&lt;/td&gt;
			&lt;/tr&gt;
		&lt;/table&gt;&lt;/td&gt;
	&lt;/tr&gt;&lt;tr&gt;
		&lt;td style=&quot;height:100%;&quot;&gt;&lt;table cellspacing=&quot;0&quot; cellpadding=&quot;2&quot; border=&quot;0&quot; style=&quot;border-color:Gray;border-width:1px;border-style:Solid;width:100%;height:100%;&quot;&gt;
			&lt;tr valign=&quot;top&quot;&gt;
				&lt;td _designerRegion=&quot;0&quot;&gt;&lt;table cellspacing=&quot;0&quot; cellpadding=&quot;2&quot; border=&quot;0&quot; style=&quot;width:100%;&quot;&gt;
					&lt;tr&gt;
						&lt;td style=&quot;height:100%;&quot;&gt;&lt;/td&gt;
					&lt;/tr&gt;
				&lt;/table&gt;&lt;/td&gt;
			&lt;/tr&gt;
		&lt;/table&gt;&lt;/td&gt;
	&lt;/tr&gt;
&lt;/table&gt;" __designer:Values="&lt;P N=&#39;AllowPersonalization&#39; T=&#39;False&#39; /&gt;&lt;P N=&#39;HeaderText&#39; T=&#39;loc:TitleBar&#39; /&gt;&lt;P N=&#39;DisplayTitle&#39; ID=&#39;1&#39; T=&#39;Title Bar&#39; /&gt;&lt;P N=&#39;AllowLayoutChange&#39; T=&#39;False&#39; /&gt;&lt;P N=&#39;ID&#39; ID=&#39;2&#39; T=&#39;TitleBar&#39; /&gt;&lt;P N=&#39;Title&#39; R=&#39;1&#39; /&gt;&lt;P N=&#39;LockLayout&#39; T=&#39;True&#39; /&gt;&lt;P N=&#39;HasAttributes&#39; T=&#39;True&#39; /&gt;&lt;P N=&#39;Page&#39; ID=&#39;3&#39; /&gt;&lt;P N=&#39;TemplateControl&#39; R=&#39;3&#39; /&gt;&lt;P N=&#39;AppRelativeTemplateSourceDirectory&#39; R=&#39;-1&#39; /&gt;"
                                            __designer:Templates="&lt;Group Name=&quot;ZoneTemplate&quot;&gt;&lt;Template Name=&quot;ZoneTemplate&quot; Content=&quot;&quot; /&gt;&lt;/Group&gt;">
                                            <ZoneTemplate></ZoneTemplate>
                                        </WebPartPages:WebPartZone>
                                    </div>
                                    <!-- Html code start -->

                                    <!-- The react app injects itself into this div-->
                                    <div id="root"></div>

                                    <!-- Html code end-->
                                    <script src="../SiteAssets/static/js/runtime-main.js"></script>
                                    <script src="../SiteAssets/static/js/2.chunk.js"></script>
                                    <script src="../SiteAssets/static/js/main.chunk.js"></script>
                                    <!--<script
                                        src="<asp:Literal runat='server' Text='<% $SPUrl:~site/SiteAssets/static/js/runtime-main.js %>' __designer:Preview="
                                        /teams/AFIMSC/NAFFASUNILDev/SiteAssets/static/js/runtime-main.js"
                                        __designer:Values="&lt;P N=&#39;Text&#39; Bound=&#39;True&#39; T=&#39;SPUrl:~site/SiteAssets/static/js/runtime-main.js&#39; /&gt;&lt;P N=&#39;ID&#39; ID=&#39;1&#39; T=&#39;ctl10&#39; /&gt;&lt;P N=&#39;Page&#39; ID=&#39;2&#39; /&gt;&lt;P N=&#39;TemplateControl&#39; R=&#39;2&#39; /&gt;&lt;P N=&#39;AppRelativeTemplateSourceDirectory&#39; R=&#39;-1&#39; /&gt;" />
                                    "></script>
                                    <script
                                        src="<asp:Literal runat='server' Text='<% $SPUrl:~site/SiteAssets/static/js/2.chunk.js %>' __designer:Preview="
                                        /teams/AFIMSC/NAFFASUNILDev/SiteAssets/static/js/2.chunk.js"
                                        __designer:Values="&lt;P N=&#39;Text&#39; Bound=&#39;True&#39; T=&#39;SPUrl:~site/SiteAssets/static/js/2.chunk.js&#39; /&gt;&lt;P N=&#39;ID&#39; ID=&#39;1&#39; T=&#39;ctl11&#39; /&gt;&lt;P N=&#39;Page&#39; ID=&#39;2&#39; /&gt;&lt;P N=&#39;TemplateControl&#39; R=&#39;2&#39; /&gt;&lt;P N=&#39;AppRelativeTemplateSourceDirectory&#39; R=&#39;-1&#39; /&gt;" />
                                    "></script>
                                    <script
                                        src="<asp:Literal runat='server' Text='<% $SPUrl:~site/SiteAssets/static/js/main.chunk.js %>' __designer:Preview="
                                        /teams/AFIMSC/NAFFASUNILDev/SiteAssets/static/js/main.chunk.js"
                                        __designer:Values="&lt;P N=&#39;Text&#39; Bound=&#39;True&#39; T=&#39;SPUrl:~site/SiteAssets/static/js/main.chunk.js&#39; /&gt;&lt;P N=&#39;ID&#39; ID=&#39;1&#39; T=&#39;ctl12&#39; /&gt;&lt;P N=&#39;Page&#39; ID=&#39;2&#39; /&gt;&lt;P N=&#39;TemplateControl&#39; R=&#39;2&#39; /&gt;&lt;P N=&#39;AppRelativeTemplateSourceDirectory&#39; R=&#39;-1&#39; /&gt;" />
                                    "></script>-->

                                    <table class="ms-core-tableNoSpace ms-webpartPage-root" width="100%">
                                        <tr>
                                            <td id="_invisibleIfEmpty" name="_invisibleIfEmpty" valign="top"
                                                width="100%">
                                                <WebPartPages:WebPartZone runat="server" Title="loc:FullPage"
                                                    ID="FullPage" FrameType="TitleBarOnly" __designer:Preview="&lt;Regions&gt;&lt;Region Name=&quot;0&quot; Editable=&quot;True&quot; Content=&quot;&quot; NamingContainer=&quot;True&quot; /&gt;&lt;/Regions&gt;&lt;table cellspacing=&quot;0&quot; cellpadding=&quot;0&quot; border=&quot;0&quot; id=&quot;FullPage&quot;&gt;
	&lt;tr&gt;
		&lt;td style=&quot;white-space:nowrap;&quot;&gt;&lt;table cellspacing=&quot;0&quot; cellpadding=&quot;2&quot; border=&quot;0&quot; style=&quot;width:100%;&quot;&gt;
			&lt;tr&gt;
				&lt;td style=&quot;white-space:nowrap;&quot;&gt;Full Page&lt;/td&gt;
			&lt;/tr&gt;
		&lt;/table&gt;&lt;/td&gt;
	&lt;/tr&gt;&lt;tr&gt;
		&lt;td style=&quot;height:100%;&quot;&gt;&lt;table cellspacing=&quot;0&quot; cellpadding=&quot;2&quot; border=&quot;0&quot; style=&quot;border-color:Gray;border-width:1px;border-style:Solid;width:100%;height:100%;&quot;&gt;
			&lt;tr valign=&quot;top&quot;&gt;
				&lt;td _designerRegion=&quot;0&quot;&gt;&lt;table cellspacing=&quot;0&quot; cellpadding=&quot;2&quot; border=&quot;0&quot; style=&quot;width:100%;&quot;&gt;
					&lt;tr&gt;
						&lt;td style=&quot;height:100%;&quot;&gt;&lt;/td&gt;
					&lt;/tr&gt;
				&lt;/table&gt;&lt;/td&gt;
			&lt;/tr&gt;
		&lt;/table&gt;&lt;/td&gt;
	&lt;/tr&gt;
&lt;/table&gt;" __designer:Values="&lt;P N=&#39;FrameType&#39; E=&#39;2&#39; /&gt;&lt;P N=&#39;HeaderText&#39; T=&#39;loc:FullPage&#39; /&gt;&lt;P N=&#39;DisplayTitle&#39; ID=&#39;1&#39; T=&#39;Full Page&#39; /&gt;&lt;P N=&#39;ID&#39; ID=&#39;2&#39; T=&#39;FullPage&#39; /&gt;&lt;P N=&#39;Title&#39; R=&#39;1&#39; /&gt;&lt;P N=&#39;PartChromeType&#39; E=&#39;3&#39; /&gt;&lt;P N=&#39;Page&#39; ID=&#39;3&#39; /&gt;&lt;P N=&#39;TemplateControl&#39; R=&#39;3&#39; /&gt;&lt;P N=&#39;AppRelativeTemplateSourceDirectory&#39; R=&#39;-1&#39; /&gt;"
                                                    __designer:Templates="&lt;Group Name=&quot;ZoneTemplate&quot;&gt;&lt;Template Name=&quot;ZoneTemplate&quot; Content=&quot;&quot; /&gt;&lt;/Group&gt;">
                                                    <ZoneTemplate></ZoneTemplate>
                                                </WebPartPages:WebPartZone>
                                            </td>
                                        </tr>
                                        <SharePoint:ScriptBlock runat="server" __designer:Preview="&lt;script type=&quot;text/javascript&quot;&gt;// &lt;![CDATA[ 


                                            if(typeof(MSOLayout_MakeInvisibleIfEmpty) == &quot;function&quot;) {MSOLayout_MakeInvisibleIfEmpty();}
                                        // ]]&gt;
&lt;/script&gt;" __designer:Values="&lt;P N=&#39;ID&#39; ID=&#39;1&#39; T=&#39;ctl13&#39; /&gt;&lt;P N=&#39;Page&#39; ID=&#39;2&#39; /&gt;&lt;P N=&#39;TemplateControl&#39; R=&#39;2&#39; /&gt;&lt;P N=&#39;AppRelativeTemplateSourceDirectory&#39; R=&#39;-1&#39; /&gt;">
                                            if(typeof(MSOLayout_MakeInvisibleIfEmpty) == "function")
                                            {MSOLayout_MakeInvisibleIfEmpty();}
                                        </SharePoint:ScriptBlock>
                                    </table>
                                </asp:Content>