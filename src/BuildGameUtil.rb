class BuildGameUtil
    def initialize()
        @builder = XcodeProjecBuilder.new
        @generator = XcodeProjectGenerator.new
    end

    def run(params)
        final_params = fill_in_empty_values(params)
        check_params(params)
        @generator.regenerate(final_params)
        # @builder.build(final_params)
    end

    def check_params(params)
        required_params = [
            :templatePath,
            :gameSrc,
            :bundleId,
            :version,
            :buildNumber,
            :appiconsetSrc,
            :launchImageSrc
        ]

        required_params.each do | param|
            if !params.key?(param)
                puts("Missing '#{param}' in the configuration file")
                exit(-1)
            end
        end
    end

    private def fill_in_empty_values(params)
        default_values = {
            xcodeProjectDir: "Xcode Project",
            sdk: "8.0",
            developmentTeam: ""
        }
        default_values.each do |key, value|
            if !params.key?(key)
                params[key] = value
            end
        end
        params
    end
end
