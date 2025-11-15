export const createPageUrl = (pageName) => {
    const routes = {
      Home: '/',
      Browse: '/browse',
      PostItem: '/post-item',
      MyItems: '/my-items',
      Messages: '/messages',
      Profile: '/profile',
      AdminPanel: '/admin',
      ItemDetail: '/item-detail'
    };
    return routes[pageName] || '/';
  };