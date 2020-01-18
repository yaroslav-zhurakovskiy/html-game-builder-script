class PofileInput
    attr_reader :google_ads
    attr_reader :mintegral_ads

    def initialize(params)
        @ios_sdk_version = params[:sdk]
        @target_name = params[:name]
        @google_ads = params.key?(:GADApplicationIdentifier)
        @mintegral_ads = params.key?(:MintegralApiKey) && params.key?(:MintegralAppID)
    end

    def get_binding
        return binding()
    end
end
