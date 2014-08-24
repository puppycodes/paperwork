paperworkModule.controller('paperworkSidebarNotebooksController', function($scope, $rootScope, $location, $routeParams, paperworkNotebooksService){
  $rootScope.notebookSelectedId = 0;
  $rootScope.tagsSelectedId = -1;

  $scope.isVisible = function() {
    return !$rootScope.expandedNoteLayout;
  };

  $scope.notebookIconByType = function(type) {
    switch(parseInt(type)) {
      case 0:
        return 'fa-book';
      break;
      case 1:
        return 'fa-folder-open';
      break;
      case 2:
        return 'fa-archive';
      break;
    }
  };

  $rootScope.getNotebookSelectedId = function() {
    return $rootScope.notebookSelectedId;
  };

  $scope.openNotebook = function(notebookId, type, index) {
    if(parseInt(type) == 0 || parseInt(type) == 2) {
      $rootScope.notebookSelectedId = parseInt(index);
      $rootScope.tagsSelectedId = -1;
      $rootScope.search = "";
      $location.path("/n/" + parseInt(notebookId) );
    }
  };

  $scope.openTag = function(tagId) {
    $rootScope.notebookSelectedId = -1;
    $rootScope.tagsSelectedId = parseInt(tagId);
    $location.path("/s/tagid:" + parseInt(tagId));
  };

  $scope.modalNewNotebook = function() {
    $rootScope.modalNotebook = {
      'action': 'create',
      'shortcut': '',
      'title': ''
    };
    $('#modalNotebook').modal("show");
  };

  $scope.modalNotebookSubmit = function() {
    var data = {
      'type': 0,
      'title': $rootScope.modalNotebook.title,
      'shortcut': $rootScope.modalNotebook.shortcut
    };

    var callback = (function(_paperworkNotebooksService) {
      return function(status, data) {
        switch(status) {
          case 200:
            $('#modalNotebook').modal('hide');
            _paperworkNotebooksService.getNotebooks();
            _paperworkNotebooksService.getNotebookShortcuts(null);
            break;
          case 400:
            if(typeof data.errors.title != "undefined") {
              $('#modalNotebook').find('input[name="title"]').parents('.form-group').addClass('has-warning');
            }
            break;
        }
      };
    })(paperworkNotebooksService);

    if($rootScope.modalNotebook.action == "create") {
      paperworkNotebooksService.createNotebook(data, callback);
    } else if($rootScope.modalNotebook.action == "edit") {
      // if($rootScope.modalNotebook.delete) {
        // paperworkNotebooksService.deleteNotebook($rootScope.modalNotebook.id, callback);
      // } else {
        paperworkNotebooksService.updateNotebook($rootScope.modalNotebook.id, data, callback);
      // }
    }
  };

  $scope.modalEditNotebook = function(notebookId) {
    var notebook = paperworkNotebooksService.getNotebookByIdLocal(notebookId);

    if(notebook == null) {
      return false;
    }

    $rootScope.modalNotebook = {
      'action': 'edit',
      'id': notebookId,
      'title': notebook.title
    };

    var shortcut = paperworkNotebooksService.getShortcutByNotebookIdLocal(notebookId);

    if(shortcut == null) {
      $rootScope.modalNotebook.shortcut = false;
    } else {
      $rootScope.modalNotebook.shortcut = true;
    }
    $('#modalNotebook').modal("show");
  };

  $scope.modalDeleteNotebook = function(notebookId) {
    var callback = (function() {
      return function(status, data) {
        switch(status) {
          case 200:
            paperworkNotebooksService.getNotebookShortcuts(null);
            paperworkNotebooksService.getNotebooks();
            $location.path("/n/0");
            break;
          case 400:
            // TODO: Show some kind of error
            break;
        }
      };
    })();


    $rootScope.messageBox({
      'title': $rootScope.i18n.keywords.delete_notebook_question,
      'content': $rootScope.i18n.keywords.delete_notebook_message,
      'buttons': [
        {
          // We don't need an id for the dismiss button.
          // 'id': 'button-no',
          'label': $rootScope.i18n.keywords.cancel,
          'isDismiss': true
        },
        {
          'id': 'button-yes',
          'label': $rootScope.i18n.keywords.yes,
          'class': 'btn-warning',
          'click': function() {
            paperworkNotebooksService.deleteNotebook(notebookId, callback);
            return true;
          },
        }
      ]
    });
  };

  paperworkNotebooksService.getNotebookShortcuts(null);
  paperworkNotebooksService.getNotebooks();
  $rootScope.tags = paperworkNotebooksService.getTags();
});