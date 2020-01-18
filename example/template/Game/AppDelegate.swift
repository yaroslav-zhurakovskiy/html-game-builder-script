import UIKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?
    let webGameControllerDelegateImpl = WebGameControllerDelegateImpl()
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
        <% if %>
        MTGSDK.sharedInstance().setAppID("123727", apiKey: "fb1eba8f974622524f29bc12bc8cb6e5")
        <% end %>
        window = UIWindow(frame: UIScreen.main.bounds)
        let rootURL = Bundle.main.bundleURL.appendingPathComponent("html-game")
        let controller = WebGameController(rootURL: rootURL, startingPage: "index.html")
        controller.delegate = webGameControllerDelegateImpl
        window?.rootViewController = controller
        window?.makeKeyAndVisible()
        
        return true
    }
}
