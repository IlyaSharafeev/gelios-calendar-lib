import IconBriefcase from '@/components/icons/IconBriefcase.vue';
import IconCrown from '@/components/icons/IconCrown.vue'
import IconSettings from '@/components/icons/IconSettings.vue'
import IconShoppingBagPlus from '@/components/icons/IconShoppingBagPlus.vue'
import IconCash from '@/components/icons/IconCash.vue'
import IconAcademicCap from '@/components/icons/IconAcademicCap.vue'
import IconMegaphone from '@/components/icons/IconMegaphone.vue'

enum Icon {
  briefcase = 'briefcase',
  crown = 'crown',
  settings = 'settings',
  shoppingBagPlus = 'shopping_bag_plus',
  finance = 'finance',
  academicCap = 'academic_cap',
  megaphone = 'megaphone',
}

export const getIconByName = (icon: Icon) => {
  const iconsMap = {
    [Icon.briefcase]: IconBriefcase,
    [Icon.crown]: IconCrown,
    [Icon.settings]: IconSettings,
    [Icon.shoppingBagPlus]: IconShoppingBagPlus,
    [Icon.finance]: IconCash,
    [Icon.academicCap]: IconAcademicCap,
    [Icon.megaphone]: IconMegaphone,
  };

  return iconsMap[icon] || null; // Return the component or null if not found
};
