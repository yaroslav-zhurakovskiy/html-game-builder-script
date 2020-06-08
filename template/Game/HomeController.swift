import UIKit

class HomeController: UIViewController {
    @IBOutlet weak var playButton: UIButton!
    @IBOutlet weak var overlayView: UIView!
    
    private let controller = GameContainer()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        controller.view.translatesAutoresizingMaskIntoConstraints = false
        view.insertSubview(controller.view, at: 0)
        NSLayoutConstraint.activate([
            controller.view.topAnchor.constraint(equalTo: self.view.topAnchor),
            controller.view.bottomAnchor.constraint(equalTo: self.view.bottomAnchor),
            controller.view.leftAnchor.constraint(equalTo: self.view.leftAnchor),
            controller.view.rightAnchor.constraint(equalTo: self.view.rightAnchor)
        ])
        addChild(controller)
        controller.didMove(toParent: self)
        
        processPlay()
    }
        
    @IBAction func processPlay() {
        overlayView.isHidden = true
        controller.playGame()
    }
}
