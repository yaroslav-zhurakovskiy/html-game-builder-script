class XcodeProjectGenerator
    def regenerate(params)
        clean(params)
        generate(params)
    end

    def clean(params) 
        xcodeProjectOutDir = get_xcode_project_out_dir(params)
        system("rm -fr #{xcodeProjectOutDir}")
    end

    def generate(params)  
        copy_files(params)
        compile_templates(params)
        generate_xcode_project(params)
        install_pods(params)
    end

    private def copy_files(params)
        copy_template(params)
        delete_unused_plugins(params)
        copy_game(params)
        copy_icon(params)
        copy_launch_image(params)
    end

    private def compile_templates(params)
        compie_info_plist(params)
        compile_app_delegate(params)
        compile_web_game_controller_delegate(params)
        compile_podfile(params)
        compile_bridging_header(params)
        compile_fastlane_files(params)
    end

    private def compile_fastlane_files(params)
        compiler = ERBCompiler.new()
        compiler.compile(
            erb_file_path: fastlane_file_path(params, 'Appfile.erb'),
            result_file_path: fastlane_file_path(params, 'Appfile'),
            input: AppFileInput.new(params)
        )
    end

    private def fastlane_file_path(params, file)
        out_dir = params[:xcodeProjectDir]
        File.expand_path("fastlane/#{file}", out_dir)
    end

    private def compile_bridging_header(params)
        compiler = ERBCompiler.new()
        compiler.compile(
            erb_file_path: target_file_path(params, 'AppBridgingHeader.erb'),
            result_file_path: target_file_path(params, 'AppBridgingHeader.h'),
            input: PofileInput.new(params)
        )
    end

    private def copy_template(params)
        out_dir = get_xcode_project_out_dir(params)
        templatePath = params[:templatePath]
        if !templatePath.nil?
            FileUtils.cp_r(templatePath, out_dir)
        end
    end

    private def delete_unused_plugins(params)
        input = PofileInput.new(params)
        if !input.google_ads
            plugin_path = target_file_path(params, 'Plugins/Google Admob')
            FileUtils.rm_rf(plugin_path)
        end

        if !input.mintegral_ads
            plugin_path = target_file_path(params, 'Plugins/Mintegral')
            FileUtils.rm_rf(plugin_path)
        end
    end

    private def copy_game(params)
        out_dir = get_xcode_project_out_dir(params)
        game_src = params[:gameSrc]
        if !game_src.nil?
            FileUtils.cp_r(game_src, out_dir)
        end
    end

    private def compile_web_game_controller_delegate(params)
        compiler = ERBCompiler.new()
        compiler.compile(
            erb_file_path: target_file_path(params, 'WebGameControllerDelegateImpl.erb'),
            result_file_path: target_file_path(params, 'WebGameControllerDelegateImpl.swift'),
            input: PofileInput.new(params)
        )
    end

    private def compile_app_delegate(params)
        compiler = ERBCompiler.new()
        compiler.compile(
            erb_file_path: target_file_path(params, 'AppDelegate.erb'),
            result_file_path: target_file_path(params, 'AppDelegate.swift'),
            input: AppDelegateInput.new(params)
        )
    end

    private def target_file_path(params, file)
        out_dir = params[:xcodeProjectDir]
        File.expand_path("Game/#{file}", out_dir)
    end

    private def compie_info_plist(params)
        compiler = ERBCompiler.new()
        compiler.compile(
            erb_file_path: target_file_path(params, 'Info.erb'),
            result_file_path: target_file_path(params, 'Info.plist'),
            input: InfoPlistInput.new(params)
        )
    end

    private def copy_launch_image(params)
        if params.key?(:launchImageSrc)
            xcassets_path = target_file_path(params, 'Assets.xcassets')
            FileUtils.cp_r(params[:launchImageSrc], xcassets_path)
        end
    end

    private def copy_icon(params)
        if params.key?(:appiconsetSrc)
            xcassets_path = target_file_path(params, 'Assets.xcassets')
            FileUtils.cp_r(params[:appiconsetSrc], xcassets_path)
        end
    end

    private def install_pods(params)
        out_dir = get_xcode_project_out_dir(params)
        Dir.chdir(out_dir) do
            system("pod install")
        end
    end

    private def generate_xcode_project(params)
        out_dir = get_xcode_project_out_dir(params)
        text = generate_xcodgen_file_content(params)
        xcodegen_project_file_name = "project.yml"
        xcodegen_project_path = File.expand_path(xcodegen_project_file_name, out_dir)
        File.open(xcodegen_project_path, 'w') { |file| file.write(text) }
        Dir.chdir(out_dir) do
            system("xcodegen --spec #{xcodegen_project_file_name}")
            system("rm #{xcodegen_project_file_name}")
        end
    end

    private def generate_xcodgen_file_content(params)
        project_name = "Game"
        target_name = "Game"
        ios_sdk = params[:sdk]
        game_src = File.basename(params[:gameSrc])
        target_src = "Game"
        dev_team_id = params[:developmentTeam]
        
        <<-YML_FILE
        name: #{project_name}
        targets:
            #{target_name}:
                type: application
                platform: iOS
                deploymentTarget: #{ios_sdk}
                sources:
                - path: #{target_src}
                - path: #{game_src}
                  type: folder
                  name: html-game
                configFiles:
                    Debug: #{target_src}/debug.xcconfig
                    Release: #{target_src}/release.xcconfig
                attributes:
                    DevelopmentTeam: #{dev_team_id}
        YML_FILE
    end

    private def compile_podfile(params)
        xcodeProjectOutDir = get_xcode_project_out_dir(params)
        podfile_templatePath = File.expand_path("Podfile.erb", xcodeProjectOutDir)
        podfile_path = File.expand_path("Podfile", xcodeProjectOutDir)
        template_text = File.read(podfile_templatePath)
        renderer = ERB.new(template_text)
        result = renderer.result(PofileInput.new(params).get_binding)
        File.write(podfile_path, result)
        File.delete(podfile_templatePath)
    end

    private def get_xcode_project_out_dir(params)
        return params[:xcodeProjectDir]
    end
end
