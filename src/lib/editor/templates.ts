export interface SocialMediaTemplate {
  id: string
  name: string
  platform: "instagram" | "twitter" | "facebook" | "linkedin"
  category: "post" | "story" | "header" | "cover" | "banner" | "reel"
  width: number
  height: number
  aspectRatio: string
  safeZone?: {
    top: number
    right: number
    bottom: number
    left: number
  }
  description?: string
}

export const socialMediaTemplates: SocialMediaTemplate[] = [
  {
    id: "instagram-post",
    name: "Instagram Post",
    platform: "instagram",
    category: "post",
    width: 1080,
    height: 1080,
    aspectRatio: "1:1",
    description: "Square post for Instagram feed",
  },
  {
    id: "instagram-story",
    name: "Instagram Story",
    platform: "instagram",
    category: "story",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    safeZone: {
      top: 250,
      right: 0,
      bottom: 250,
      left: 0,
    },
    description: "Vertical story format for Instagram",
  },
  {
    id: "instagram-reel",
    name: "Instagram Reel",
    platform: "instagram",
    category: "reel",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    safeZone: {
      top: 250,
      right: 0,
      bottom: 250,
      left: 0,
    },
    description: "Vertical video format for Instagram Reels",
  },
  {
    id: "twitter-post",
    name: "Twitter/X Post",
    platform: "twitter",
    category: "post",
    width: 1200,
    height: 675,
    aspectRatio: "16:9",
    description: "Standard post image for Twitter/X",
  },
  {
    id: "twitter-header",
    name: "Twitter/X Header",
    platform: "twitter",
    category: "header",
    width: 1500,
    height: 500,
    aspectRatio: "3:1",
    safeZone: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    description: "Profile header banner for Twitter/X",
  },
  {
    id: "facebook-post",
    name: "Facebook Post",
    platform: "facebook",
    category: "post",
    width: 1200,
    height: 630,
    aspectRatio: "1.91:1",
    description: "Standard post image for Facebook",
  },
  {
    id: "facebook-cover",
    name: "Facebook Cover",
    platform: "facebook",
    category: "cover",
    width: 820,
    height: 312,
    aspectRatio: "2.63:1",
    safeZone: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    description: "Profile cover photo for Facebook",
  },
  {
    id: "linkedin-post",
    name: "LinkedIn Post",
    platform: "linkedin",
    category: "post",
    width: 1200,
    height: 627,
    aspectRatio: "1.91:1",
    description: "Standard post image for LinkedIn",
  },
  {
    id: "linkedin-banner",
    name: "LinkedIn Banner",
    platform: "linkedin",
    category: "banner",
    width: 1584,
    height: 396,
    aspectRatio: "4:1",
    safeZone: {
      top: 0,
      right: 200,
      bottom: 0,
      left: 0,
    },
    description: "Profile banner for LinkedIn",
  },
]

export function getTemplatesByPlatform(
  platform: SocialMediaTemplate["platform"],
) {
  return socialMediaTemplates.filter((t) => t.platform === platform)
}

export function getTemplatesByCategory(
  category: SocialMediaTemplate["category"],
) {
  return socialMediaTemplates.filter((t) => t.category === category)
}

export function getTemplateById(id: string) {
  return socialMediaTemplates.find((t) => t.id === id)
}
