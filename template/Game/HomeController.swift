import UIKit

class HomeController: UIViewController {
    @IBOutlet weak var playButton: UIButton!
        
    @IBAction func processPlay() {
        let controller = GameContainer()
        controller.view.frame = view.bounds
        controller.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.addSubview(controller.view)
        addChild(controller)
        controller.didMove(toParent: self)
    }
}

extension UIImage {
    static var appIcon: UIImage? {
        guard 
            let iconsDictionary = Bundle.main.infoDictionary?["CFBundleIcons"] as? [String:Any],
            let primaryIconsDictionary = iconsDictionary["CFBundlePrimaryIcon"] as? [String:Any],
            let iconFiles = primaryIconsDictionary["CFBundleIconFiles"] as? [String],
            let lastIcon = iconFiles.last
        else  {
            return nil
        }
        
        return UIImage(named: lastIcon)
    }
}
