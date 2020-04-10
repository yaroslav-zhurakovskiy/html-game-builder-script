#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@class WebGameController;

@interface MTGInterstitialAdPresenter : NSObject

- (void)presentFromWebGameController:(WebGameController *)viewController
                              unitID:(NSString *)unitID;

@end

NS_ASSUME_NONNULL_END
