class AppDelegateInput
    def initialize(params)
        @MintegralApiKey = params[:MintegralApiKey]
        @MintegralAppID = params[:MintegralAppID]
        @BytedanceAppID = params[:BytedanceAppID]
    end

    def get_binding
        binding
    end
end
