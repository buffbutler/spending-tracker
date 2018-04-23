from django.urls import path

from .views import StartView, DemoView, WorkspaceView, WorkspaceViewSet, RuleViewSet, JournalViewSet, AddFile, JournalFileSearch

app_name = 'spending_api'

urlpatterns = [
    path('', StartView.as_view(), name='start'),
    path('demo', DemoView.as_view(), name='demo'),
    path('workspace/<slug:public_key>/journal', WorkspaceView.as_view(), name='workspace'),
    path('workspace/<slug:wspid>/upload', AddFile.as_view(), name='workspace_add_file'),
    path('api/workspace/<slug:public_key>', WorkspaceViewSet.as_view(), name='rest_workspace'),
    path('api/workspace/<slug:wspid>/journal', JournalViewSet.as_view(), name='rest_journal'),
    path('api/workspace/<slug:wspid>/journal/file/<slug:fileid>', JournalFileSearch.as_view(), name='rest_journal_file'),
    path('api/workspace/<slug:wspid>/journal/<int:pk>', JournalViewSet.as_view(), name='rest_update_journal'),
    path('api/workspace/<slug:wspid>/rule', RuleViewSet.as_view(), name='rest_rule'),
    path('api/workspace/<slug:wspid>/rule/<int:pk>', RuleViewSet.as_view(), name='rest_update_rule'),
]
