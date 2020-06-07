#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@class WebGameController;

@interface MTGSplashAdPresenter : NSObject

- (void)presentFromWebGameController:(WebGameController *)viewController
                              unitID:(NSString *)unitID
                           countdown:(NSUInteger)countdown
                           allowSkip:(BOOL)allowSkip
                           callbacks:(NSDictionary<NSString *, NSString *> *)callbacks;

@end

NS_ASSUME_NONNULL_END
