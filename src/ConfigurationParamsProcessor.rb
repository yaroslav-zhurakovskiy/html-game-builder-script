class ConfigurationParamsProcessor
    def process(params)
        final_params = fill_in_empty_values(params)
        check_for_required_params(final_params)
        final_params
    end

    private def check_for_required_params(params)
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