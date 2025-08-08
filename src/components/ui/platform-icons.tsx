// Replace src/components/ui/platform-icons.tsx
import { 
  FaWindows, 
  FaPlaystation, 
  FaXbox, 
  FaApple, 
  FaAndroid,
  FaLinux,
  FaDesktop,
  FaMobile
} from 'react-icons/fa'
import { SiNintendoswitch } from 'react-icons/si'

interface PlatformIconProps {
  platform: string
  className?: string
}

export function PlatformIcon({ platform, className = "w-4 h-4" }: PlatformIconProps) {
  const platformName = platform.toLowerCase()
  
  if (platformName.includes('pc') || platformName.includes('windows')) {
    return <FaWindows className={className} title={platform} />
  }
  
  if (platformName.includes('playstation') || platformName.includes('ps')) {
    return <FaPlaystation className={className} title={platform} />
  }
  
  if (platformName.includes('xbox')) {
    return <FaXbox className={className} title={platform} />
  }
  
  if (platformName.includes('nintendo') || platformName.includes('switch')) {
    return <SiNintendoswitch className={className} title={platform} />
  }
  
  if (platformName.includes('ios') || platformName.includes('iphone') || platformName.includes('mac')) {
    return <FaApple className={className} title={platform} />
  }
  
  if (platformName.includes('android')) {
    return <FaAndroid className={className} title={platform} />
  }
  
  if (platformName.includes('linux')) {
    return <FaLinux className={className} title={platform} />
  }
  
  if (platformName.includes('mobile')) {
    return <FaMobile className={className} title={platform} />
  }
  
  // Default fallback
  return <FaDesktop className={className} title={platform} />
}
