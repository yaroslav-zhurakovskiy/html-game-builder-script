#import "NSObject+Logging.h"

@implementation NSObject (Logging)

- (void)log:(NSString *)log {
    NSLog(@"%@", log);
}

@end
