class AppFileInput
    def initialize(params)
        @bundle_id=params[:bundleId]

        if params.key?(:fastlane)
            fastlane = params[:fastlane]

            @apple_id=fastlane["appleID"]
            @team_id=fastlane["teamID"]
            @itc_team_id=fastlane["itcTeamID"]
        end
    end

    def get_binding
        return binding()
    end
end
