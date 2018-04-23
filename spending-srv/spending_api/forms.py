from django import forms


class FileFieldForm(forms.Form):
    """
    There were bigger dreams here once :P
    """
    file_field = forms.FileField(widget=forms.ClearableFileInput(attrs={'multiple': True}))

