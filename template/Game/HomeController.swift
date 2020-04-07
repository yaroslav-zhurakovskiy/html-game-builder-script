import UIKit

class HomeController: UIViewController {
    @IBOutlet weak var playButton: UIButton!
        
    override func viewDidLoad() {
        super.viewDidLoad()
        
        playButton.setTitle(
            NSLocalizedString("Play Now", comment: "Play Now"),
            for: []
        )
    }
    
    @IBAction func processPlay() {
        navigationController?.pushViewController(GameContainer(), animated: true)
    }
}
