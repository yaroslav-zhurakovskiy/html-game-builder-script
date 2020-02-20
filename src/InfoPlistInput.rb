class InfoPlistInput
    def initialize(params)
        @GADApplicationIdentifier=params[:GADApplicationIdentifier]
        @bundle_id=params[:bundleId]
        @version=params[:version]
        @build=params[:buildNumber]
        @bundle_name=params[:name]
        
        @UISupportedInterfaceOrientations=params[:supportedInterfaceOrientations]
        @UISupportedInterfaceOrientationsIPad=params[:supportedInterfaceOrientationsIPad]
        @UISupportedInterfaceOrientationsIPad=params[:supportedInterfaceOrientationsIPad]
        @UIStatusBar=params[:statusBar]
        @launchImageSrc=params.key?(:launchImageSrc)
    end

    def get_binding
        return binding()
    end
end
