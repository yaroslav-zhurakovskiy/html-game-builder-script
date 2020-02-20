#import <UIKit/UIKit.h>
#import <MTGSDK/MTGSDK.h>
#import <MTGSDKBanner/MTGBannerAdView.h>
#import <MTGSDKBanner/MTGBannerAdViewDelegate.h>

NS_ASSUME_NONNULL_BEGIN

@interface MTGBannerAdViewPresenter : NSObject

- (void)presentFromViewController:(UIViewController *)controller
                             size:(MTGBannerSizeType)size
                        placement:(NSInteger)placement
                  autoRefreshTime:(nullable NSNumber *)autoRefreshTime
                           unitID:(NSString *)unitID;

- (void)dismiss;

@end

NS_ASSUME_NONNULL_END
