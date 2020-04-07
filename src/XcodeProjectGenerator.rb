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
        compile_info_plist(params)
        compile_app_delegate(params)
        compile_web_game_controller(params)
        compile_web_game_controller_delegate(params)
        compile_podfile(params)
        compile_bridging_header(params)
        compile_fastlane_files(params)
        compile_plugins(params)
        compile_xcconfig_files(params)
        compile_ads_timer(params)
    end

    private def compile_xcconfig_files(params)
        compile_xcconfig_file("debug", params)
        compile_xcconfig_file("release", params)
    end

    private def compile_xcconfig_file(file_name, params)
        compiler = ERBCompiler.new()
        compiler.compile(
            erb_file_path: target_file_path(params, "#{file_name}.xcconfig.erb"),
            result_file_path: target_file_path(params, "#{file_name}.xcconfig"),
            input: XCConfigInput.new(params)
        )
    end

    private def compile_plugins(params)
        compile_google_admob_plugin(params)
        compile_mintegral_plugin(params)
        compile_bytedance_plugin(params)
    end

    private def compile_google_admob_plugin(params)
        file_name = "GoogleAdmob"
        compiler = ERBCompiler.new()
        compiler.compile(
            erb_file_path: target_file_path(params, "Plugins/Google Admob/#{file_name}.erb"),
            result_file_path: target_file_path(params, "Plugins/Google Admob/#{file_name}.swift"),
            input: PluginFileInput.new(params)
        )
    end

    private def compile_mintegral_plugin(params)
        compile_mintegral_video_plugin(params)
        compile_mintegral_banner_plugin(params)
    end

    private def compile_mintegral_video_plugin(params)
        file_name = "Mintegral"
        compiler = ERBCompiler.new()
        compiler.compile(
            erb_file_path: target_file_path(params, "Plugins/Mintegral/#{file_name}.erb"),
            result_file_path: target_file_path(params, "Plugins/Mintegral/#{file_name}.swift"),
            input: PluginFileInput.new(params)
        )
    end

    private def compile_mintegral_banner_plugin(params)
        file_name = "MintegralBanner"
        compiler = ERBCompiler.new()
        compiler.compile(
            erb_file_path: target_file_path(params, "Plugins/Mintegral/#{file_name}.erb"),
            result_file_path: target_file_path(params, "Plugins/Mintegral/#{file_name}.swift"),
            input: PluginFileInput.new(params)
        )
    end

    private def compile_bytedance_plugin(params)
        file_name = "Bytedance"
        compiler = ERBCompiler.new()
        compiler.compile(
            erb_file_path: target_file_path(params, "Plugins/Bytedance/#{file_name}.erb"),
            result_file_path: target_file_path(params, "Plugins/Bytedance/#{file_name}.swift"),
            input: PluginFileInput.new(params)
        )
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

    private def compile_ads_timer(params)
        compiler = ERBCompiler.new()
        compiler.compile(
            erb_file_path: target_file_path(params, 'GameTimer.erb'),
            result_file_path: target_file_path(params, 'GameTimer.swift'),
            input: GameTimerInput.new(params)
        )
    end

    private def copy_template(params)
        out_dir = get_xcode_project_out_dir(params)
        template_path = params[:templatePath]
        if !template_path.nil?
            FileUtils.cp_r(template_path, out_dir)
        else
            if Dir.exists?(system_template_path)
                copy_template_from_system_dir(out_dir)
            else
                puts "'#{system_template_path}' does not exist. Please install it."
                exit(-1)
            end
        end
    end

    private def copy_template_from_system_dir(out_dir)
        FileUtils.cp_r(system_template_path, out_dir)
    end

    private def system_template_path()
        File.expand_path(".#{SCRIPT_NAME}/template", ENV['HOME'])
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

        if !input.bytedance_ads
            plugin_path = target_file_path(params, 'Plugins/Bytedance')
            FileUtils.rm_rf(plugin_path)
        end
    end

    private def copy_game(params)
        game_src = params[:gameSrc]
        if !game_src.nil?
            FileUtils.cp_r(game_src, game_directory(params))
        end
    end

    private def compile_web_game_controller(params)
        compiler = ERBCompiler.new()
        compiler.compile(
            erb_file_path: target_file_path(params, 'Sandbox/WebGameController.swift.erb'),
            result_file_path: target_file_path(params, 'Sandbox/WebGameController.swift'),
            input: PofileInput.new(params)
        )
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

    private def compile_info_plist(params)
        compiler = ERBCompiler.new()
        compiler.compile(
            erb_file_path: target_file_path(params, 'Info.erb'),
            result_file_path: target_file_path(params, 'Info.plist'),
            input: InfoPlistInput.new(params)
        )
    end

    private def copy_icon(params)
        if params.key?(:appiconsetSrc)
            xcassets_path = target_file_path(params, 'Assets.xcassets')
            FileUtils.cp_r(params[:appiconsetSrc], xcassets_path)
        end
    end

    private def copy_launch_image(params)
        if params.key?(:launchImageSrc)
            xcassets_path = target_file_path(params, 'Assets.xcassets')
            launch_image_src = params[:launchImageSrc]
            FileUtils.cp_r(launch_image_src, xcassets_path)
            File.rename(
                File.expand_path(launch_image_src, xcassets_path),
                File.expand_path("LaunchImage.launchimage", xcassets_path), 
            )
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
        game_directory = File.basename(game_directory(params))
        target_src = "Game"
        dev_team_id = params[:developmentTeam]
        bundle_id = params[:bundleId]
        launch_image_name = params.key?(:launchImageSrc) ? "LaunchImage" : ""
        
        <<-YML_FILE
        name: #{project_name}
        targets:
            #{target_name}:
                type: application
                platform: iOS
                deploymentTarget: #{ios_sdk}
                dependencies:
                     - sdk: WebKit.framework 
                sources:
                - path: #{target_src}
                - path: #{game_directory}
                  type: folder
                  name: html-game
                attributes:
                    DevelopmentTeam: #{dev_team_id}
                settings:
                    base:
                        PRODUCT_BUNDLE_IDENTIFIER: #{bundle_id}
                        VERSIONING_SYSTEM: apple-generic
                        ASSETCATALOG_COMPILER_LAUNCHIMAGE_NAME: #{launch_image_name}
                        SWIFT_OBJC_BRIDGING_HEADER: ${SRCROOT}/Game/AppBridgingHeader.h
        YML_FILE
    end

    private def game_directory(params)
        File.expand_path("html-game", params[:xcodeProjectDir])
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
