class InfoPlistInput
    def initialize(params)
        @GADApplicationIdentifier=params[:GADApplicationIdentifier]
        @bundle_id=params[:bundleId]
        @version=params[:version]
        @build=params[:buildNumber]
        @bundle_name=params[:name]
    end

    def get_binding
        return binding()
    end
end
