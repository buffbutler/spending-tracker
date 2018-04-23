from rest_framework import generics
from rest_framework import mixins
from rest_framework import response
from rest_framework import status

from django.conf import settings
from django.views.generic import FormView
from django.views import View
from django.shortcuts import render
from django.http import JsonResponse, HttpResponseRedirect
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from django.core.files.storage import FileSystemStorage

from .models import Journal, Rule, WorkFile, Workspace
from .forms import FileFieldForm
from .serializer import JournalSerializer, RuleSerializer, WorkspaceSerializer

# User Interface


class FileUploadWorkflowMixin:
    """
    Mixin for handling file upload, this appears on both the landing page
    and the user can drag and drop another file at any time
    """

    def handle_file_upload(self, request, my_workspace):
        """
        Given an http request, accept the file upload from form element "file" and save
        it to the workspace.  This will parse the file
        :param request: The django wrapped http request
        :param my_workspace: The workspace entity object we are attaching the file to
        :return A django JsonResponse object (pass or fail) - if a fail an error field will exist
        """

        my_file = request.FILES['file']

        intake_file = my_workspace.intake_file(my_file.name)
        intake_file.save()

        file_name = intake_file.get_file_name()

        # save the file based on intake naming rules
        fs = FileSystemStorage()
        fs.save(file_name, my_file)

        # now we take the file and break it up into the journal
        try:
            # standard file workflow
            if not intake_file.parse_to_journal(fs):
                # if we could not find a reader the function returns false
                return JsonResponse({
                    'error': 'Could not recognize the file type'
                })
        except Exception as e:
            # general fault; say a parser throws an error
            return JsonResponse({
                'error': 'Reading file failed:' + str(e)
            })

        # return the info
        return JsonResponse({
            'workspace': my_workspace.public_key,
            'file': intake_file.public_key,
            'redirect': './workspace/{0}/journal'.format(my_workspace.public_key)
        })


class StartView(FileUploadWorkflowMixin, FormView):

    """
    The starting location for creating a new session
    """

    form_class = FileFieldForm
    template_name = 'spending_api/start.html'

    def post(self, request, *args, **kwargs):
        if request.FILES['file']:
            # create a workspace and attach the file
            my_workspace = Workspace()
            my_workspace.save()

            return self.handle_file_upload(request, my_workspace)

        return render(request, 'spending_api/start.html')


class DemoView(FormView):

    def post(self, request, *args, **kwargs):
        my_workspace = Workspace()
        my_workspace.save()

        # copy all jouranl records from the demo
        journals = Journal.objects.filter(workspace_id=settings.SAMPLE_WORKSPACE_ID)

        for current_journal in journals:
            # itterate all the fields copyin into a dictionary
            kwargs_current = {
                'name': current_journal.name,
                'amount': current_journal.amount,
                'transaction_date': current_journal.transaction_date
            }

            # now create the new object
            my_journal = my_workspace.journal_set.create(**kwargs_current)
            my_journal.save()

        # done, redirect to the demo workspace
        return HttpResponseRedirect('./workspace/{0}/journal'.format(my_workspace.public_key))


@method_decorator(csrf_exempt, name='dispatch')
class AddFile(FileUploadWorkflowMixin, FormView):
    form_class = FileFieldForm

    def post(self, request, *args, **kwargs):
        wspid = self.kwargs['wspid']
        my_workspace = Workspace.objects.filter(public_key=wspid).first()

        # if a workspace was not found then return an error
        if not my_workspace:
            return JsonResponse({
                'error': 'workspace not found'
            })

        if request.FILES['file']:
            # standard file workflow
            return self.handle_file_upload(request, my_workspace)

        return JsonResponse({
            'error': 'Upload failed'
        })


class WorkspaceView(View):

    def get(self, request, public_key):
        return render(request, 'spending_api/workspace.html', {
            'workspace_id': public_key,
            'client_conf': settings.EMBER_CLIENT_CONF_JSON
        })


# API

# /workspace viewset
# a) a workspace can be requested by id (no list)
# b) the workspace will contain the journal and any rules created
# c) update, delete are not permitted, create is currently not allowed

# /workspace/{wpid}/journal viewset
# a) update, delete are not permitted
# b) retrieval by list allowed

# /workspace/{wpid}/rules viewset
# a) CRUD allowed filtered on wpid
# b) create can have query string ?apply=true to autmoatically apply the new rule (TODO)


class WorkspaceViewSet(mixins.RetrieveModelMixin,
                       generics.GenericAPIView):
    """
    A viewset for reading the details of a workspace (journal and rules)
    """

    queryset = Workspace.objects.all()
    serializer_class = WorkspaceSerializer
    lookup_field = "public_key"

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)


class JournalViewSet(mixins.ListModelMixin,
                     mixins.UpdateModelMixin,
                     generics.GenericAPIView):

    """
    For handling journal changes, all urls must contain a wspid (workspace public key)
    """

    serializer_class = JournalSerializer

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

    def get_queryset(self):
        """
        We're overriding the default behaviour to filter on the workspace id
        :return:
        """
        wspid = self.kwargs['wspid']

        return Journal.objects.filter(workspace__public_key=wspid)


class RuleViewSet(mixins.UpdateModelMixin,
                  mixins.DestroyModelMixin,
                  mixins.ListModelMixin,
                  mixins.CreateModelMixin,
                  generics.GenericAPIView):
    """
    For handling rule changes, all urls must contain a wspid (workspace public key)
    """

    serializer_class = RuleSerializer

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        # here we are creating objects based on the parent id path
        # I had to dig a little through mixin.py and serializers; this
        # is a copy of modified code from the CreateModelMixin

        # the point of this logic is to pre populate the etity with the parent id

        wspid = self.kwargs['wspid']
        workspace = Workspace.objects.filter(public_key=wspid).first()

        if not workspace:
            raise ValueError('The workspace was not found')

        # from the mixin
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # custom, assign the workspace
        serializer.validated_data['workspace_id'] = workspace.id

        # from the mixin
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return response.Response(serializer.data, status=status.HTTP_201_CREATED)

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)

    def get_queryset(self):
        """
        We're overriding the default behaviour to filter on the workspace id
        :return:
        """
        wspid = self.kwargs['wspid']

        return Rule.objects.filter(workspace__public_key=wspid)


class JournalFileSearch(mixins.ListModelMixin,
                        mixins.CreateModelMixin,
                        generics.GenericAPIView):

    """
    Future design planning... not used :)
    """

    serializer_class = JournalSerializer

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def get_queryset(self):
        """
        We're overriding the default behaviour to filter on the workspace id
        :return:
        """
        wspid = self.kwargs['wspid']
        fileid = self.kwargs['fileid']

        return Journal.objects.filter(workspace__public_key=wspid, source=fileid)

