class BuildGameUtil
    def initialize()
        @builder = XcodeProjecBuilder.new
        @generator = XcodeProjectGenerator.new
    end

    def run(params)
        final_params = fill_in_empty_values(params)
        check_params(params)
        @generator.regenerate(final_params)
        @builder.build(final_params)
    end

    def check_params(params)
        pp params
    end

    private def fill_in_empty_values(params)
        default_values = {
        xcodeProjectDir: "Xcode Project",
        sdk: "8.0"
        }
        default_values.each do |key, value|
        if !params.key?(key)
            params[key] = value
        end
        end
        params
    end
end
