import { MenuItem } from './menu.model';

export const ADMINMENU: MenuItem[] = [
  {
    label: 'Products',
    icon: 'mdi mdi-basket',
    link: '/admin/products'
  }
];
export const WHOLESALERMENU: MenuItem[] = [
  {
    label: 'Supply chains',
    icon: 'mdi mdi-truck-delivery',
    link: '/wholesaler/filiera'
  },
  {
    label: 'Warehouse',
    icon: 'mdi mdi-home-modern',
    link: '/wholesaler/magazzino'
  }
];
export const PRODUCERMENU: MenuItem[] = [
  {
    label: 'Supply chains',
    icon: 'mdi mdi-truck-delivery',
    link: '/filiere'
  },
  {
    label: 'Shipments',
    icon: 'mdi mdi-cart',
    link: '/producer/spedizioni'
  }
];

export const DRIVERMENU: MenuItem[] = [
  {
    label: 'Supply chains',
    icon: 'mdi mdi-truck-delivery',
    link: '/filiere'
  },
  {
    label: 'Transactions',
    icon: 'mdi mdi-cart',
    link: '/driver/transazioni'
  }
];
