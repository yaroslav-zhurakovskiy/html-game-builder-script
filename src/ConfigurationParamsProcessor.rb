class ConfigurationParamsProcessor
    def process(params)
        final_params = fill_in_empty_values(params)
        check_for_required_params(final_params)
        check_template(final_params)
        final_params
    end

    private def check_for_required_params(params)
        required_params = [
            :gameSrc,
            :bundleId,
            :version,
            :buildNumber,
            :appiconsetSrc
        ]

        required_params.each do | param|
            if !params.key?(param)
                puts("Missing '#{param}' in the configuration file")
                exit(-1)
            end
        end
    end

    private def check_template(params)
        if !params.key?(:templatePath)
            return
        end

        if !Dir.exist?(params[:templatePath])
            puts "Template directory '#{params[:templatePath]}'' dose not exist."
            exit(-1)
        end
    end

    private def fill_in_empty_values(params)
        default_values = {
            xcodeProjectDir: "Xcode Project",
            sdk: "9.0",
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