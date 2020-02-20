class XCConfigInput
    def initialize(params)
        @bundleId = params[:bundleId]
        @launchImageSrc = params[:launchImageSrc]
    end

    def get_binding
        return binding()
    end
end
