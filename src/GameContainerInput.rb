class GameContainerInput
    def initialize(params)
        @game_timer_is_on = params.key?(:GameTimer)
        @OnPlayRequest = params[:OnPlayRequest]
    end

    def get_binding
        binding
    end
end
