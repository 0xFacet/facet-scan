export interface INavigation {
  logo: string
  navigation: INavLink[]
}

export interface INavLink {
  name: string
  link: string
  target: boolean
}

export const NAVIGATION: INavigation = {
  logo: 'Ethscriptions',
  navigation: [
    {
      name: 'Contracts',
      link: '/contracts',
      target: false,
    },
    {
      name: 'Github',
      link: 'https://github.com/ethscriptions-protocol',
      target: true,
    },
    {
      name: 'Docs',
      link: 'https://docs.ethscriptions.com/v/ethscriptions-vm',
      target: true,
    },
  ],
}
