module.exports = {
  query: '.PNG',
  searchOptions: {
    'file_status': 'active',
    'filename_only': true,
    'max_results': 1000,
    'file_categories': ['image'],
    'file_extensions': ['jpg', 'png'],
    'order_by': 'relevance',
    'path': '/'
  },
  renameRules: [
    {
      pattern: /\.(JPG|JPEG|jpeg)$/,
      newString: '.jpg'
    }, {
      pattern: /\.PNG$/,
      newString: '.png'
    }
  ]
};
