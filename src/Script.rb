class Script
    def initialize()
        @builder = XcodeProjecBuilder.new
        @generator = XcodeProjectGenerator.new
        @params_loader = BuildParamsLoader.new
        @input_parser = ScriptInputParser.new
        @input_provider = ScriptInputProvider.new(@input_parser)
        @configuration_params_processor = ConfigurationParamsProcessor.new
    end

    def run()
        if @input_provider.get_action == :help
            @input_parser.print_help
            exit
        end

        loaded_params = @params_loader.load(@input_provider)
        final_params = @configuration_params_processor.process(loaded_params)

        if @input_provider.get_action == :generate
            @generator.regenerate(final_params)
        elsif @input_provider.get_action == :build
            @generator.regenerate(final_params)
            @builder.build(final_params)
        elsif @input_provider.get_action == :upload
            @generator.regenerate(final_params)
            @builder.upload(final_params)
        end
    end
end
