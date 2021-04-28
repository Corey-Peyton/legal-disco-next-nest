<template>
  <div>
    </div>
</template>
<script>
export default {
  data() {
    return {
      appName: 'Boiler',
      drawer: true,
      fixed: false,
      analyticsItems: [
        {
          icon: 'dashboard',
          title: 'Dashboard',
          link: '/dashboard/overview',
        },
        {
          icon: 'event',
          title: 'Events',
          link: '',
        },
        {
          icon: 'comment',
          title: 'Notifications',
          link: '',
        },
      ],
      developItems: [
        {
          icon: 'supervisor_account',
          title: 'Authentification',
          link: '',
        },
        {
          icon: 'storage',
          title: 'Database',
          link: '',
        },
        {
          icon: 'perm_media',
          title: 'Storage',
          link: '',
        },
        {
          icon: 'public',
          title: 'Hosting',
          link: '',
        },
        {
          icon: 'functions',
          title: 'Functions',
          link: '',
        },
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      tabs: null,
      tabsItems: [
        {
          id: 1,
          title: 'Indicators',
          link: 'indicators',
        },
        {
          id: 2,
          title: 'Backup',
          link: 'backup',
        },
        {
          id: 3,
          title: 'Logs',
          link: 'logs',
        },
      ],
      menuItems: ['Vue', 'NodeJS', 'Laravel'],
    };
  },
};
</script>
