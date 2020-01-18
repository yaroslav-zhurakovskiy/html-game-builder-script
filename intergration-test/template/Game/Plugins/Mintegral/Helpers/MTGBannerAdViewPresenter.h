//
//  MTGBannerAdViewPresenter.h
//  TestWebKit
//
//  Created by Yaroslav Zhurakovskiy on 16.01.2020.
//  Copyright © 2020 Yaroslav Zhurakovskiy. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <MTGSDK/MTGSDK.h>
#import <MTGSDKBanner/MTGBannerAdView.h>
#import <MTGSDKBanner/MTGBannerAdViewDelegate.h>

NS_ASSUME_NONNULL_BEGIN

@interface MTGBannerAdViewPresenter : NSObject

- (void)presentFromViewController:(UIViewController *)controller
                             size:(MTGBannerSizeType)size
                  autoRefreshTime:(nullable NSNumber *)autoRefreshTime
                           unitID:(NSString *)unitID;

- (void)dismiss;

@end

NS_ASSUME_NONNULL_END
