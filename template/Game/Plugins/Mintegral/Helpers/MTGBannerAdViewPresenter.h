#import <UIKit/UIKit.h>
#import <MTGSDK/MTGSDK.h>
#import <MTGSDKBanner/MTGBannerAdView.h>
#import <MTGSDKBanner/MTGBannerAdViewDelegate.h>

NS_ASSUME_NONNULL_BEGIN

@class WebGameController;

@interface MTGBannerAdViewPresenter : NSObject

- (void)presentFromWebGameController:(WebGameController *)controller
                                size:(MTGBannerSizeType)sizeType
                           placement:(NSInteger)placement
                     autoRefreshTime:(nullable NSNumber *)autoRefreshTime
                              unitID:(NSString *)unitID
                           callbacks:(NSDictionary<NSString *, NSString *> *)callbacks;

- (void)dismiss;

@end

NS_ASSUME_NONNULL_END
