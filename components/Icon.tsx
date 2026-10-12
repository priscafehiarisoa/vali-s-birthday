import {
  IconAlertTriangle,
  IconBackpack,
  IconBalloon,
  IconBed,
  IconBrandWhatsapp,
  IconCake,
  IconCalendarHeart,
  IconCat,
  IconClock,
  IconCoin,
  IconGift,
  IconHeart,
  IconInfoCircle,
  IconLock,
  IconLogout,
  IconMapPin,
  IconMoon,
  IconMoonStars,
  IconPaw,
  IconPhone,
  IconPizza,
  IconScript,
  IconShirt,
  IconStar,
  IconTrash,
  IconUsers,
  type IconProps,
} from "@tabler/icons-react";

/**
 * Tabler icons usable from content.json, by their tabler.io name (e.g. "map-pin").
 * To use a new one: find it on https://tabler.io/icons, import it above and add it here.
 * Only listed icons are bundled, which keeps the page light on mobile.
 */
const ICONS = {
  "alert-triangle": IconAlertTriangle,
  backpack: IconBackpack,
  balloon: IconBalloon,
  bed: IconBed,
  "brand-whatsapp": IconBrandWhatsapp,
  cake: IconCake,
  "calendar-heart": IconCalendarHeart,
  cat: IconCat,
  clock: IconClock,
  coin: IconCoin,
  gift: IconGift,
  heart: IconHeart,
  "info-circle": IconInfoCircle,
  lock: IconLock,
  logout: IconLogout,
  "map-pin": IconMapPin,
  moon: IconMoon,
  "moon-stars": IconMoonStars,
  paw: IconPaw,
  phone: IconPhone,
  pizza: IconPizza,
  script: IconScript,
  shirt: IconShirt,
  star: IconStar,
  trash: IconTrash,
  users: IconUsers,
};

export default function Icon({ name, ...props }: { name: string } & IconProps) {
  const Cmp = ICONS[name as keyof typeof ICONS] ?? IconCat;
  return <Cmp stroke={1.8} {...props} />;
}
