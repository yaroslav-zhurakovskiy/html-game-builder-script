class PofileInput
    attr_reader :google_ads
    attr_reader :mintegral_ads
    attr_reader :bytedance_ads

    def initialize(params)
        @ios_sdk_version = params[:sdk]
        @target_name = "Game"
        @google_ads = params.key?(:GADApplicationIdentifier)
        @mintegral_ads = params.key?(:MintegralApiKey) && params.key?(:MintegralAppID)
        @bytedance_ads = params.key?(:BytedanceAppID)
        @autoshowBanner = params[:autoshowBanner] == true
        @InjectJavaScript = params[:InjectJavaScript]
    end

    def get_binding
        return binding()
    end
end
