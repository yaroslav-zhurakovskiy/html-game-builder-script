class AppDelegateInput
    def initialize(params)
        @MintegralApiKey = params[:MintegralApiKey]
        @MintegralAppID = params[:MintegralAppID]
    end

    def get_binding
        binding
    end
end
