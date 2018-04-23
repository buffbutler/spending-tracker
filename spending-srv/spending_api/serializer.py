from rest_framework import serializers

from .models import Journal, Rule, Workspace

from collections import OrderedDict


class EmberSerializerResponseMixin(object):
    """
    Split out the dictionary "shape" to represent ember objects
    This is easier then client side because we can just cUrl our way to success
    """
    def to_representation(self, instance):
        # ret = super(serializers.ModelSerializer, self).to_representation(instance)
        ret = serializers.ModelSerializer.to_representation(self, instance)

        model_name = getattr(self.Meta, 'model').__name__

        # wrap the object in the model name
        final = OrderedDict()
        final[model_name] = ret

        return final

    def to_internal_value(self, data):
        # all we're doing here is unwrapping the representation... it will have one extra layer
        # then passing the value to the super

        model_name = getattr(self.Meta, 'model').__name__.lower()

        data_sub = None

        # strip the case out of the dictionary... this is kind of unecssiary becase
        # we should really just be taking the first
        for field, possible_values in data.items():
            if field == model_name:
                data_sub = possible_values

        return serializers.ModelSerializer.to_internal_value(self, data_sub)



class JournalSerializer(EmberSerializerResponseMixin,
                        serializers.ModelSerializer):
    class Meta:
        model = Journal
        fields = ('name', 'amount', 'transaction_date', 'path_classification', 'source', 'id', 'applied_rule')


class RuleSerializer(EmberSerializerResponseMixin,
                     serializers.ModelSerializer):
    class Meta:
        model = Rule
        fields = ('expression', 'path', 'amount_from', 'amount_to', 'id', 'public_key')


class WorkspaceSerializer(serializers.ModelSerializer):
    journal = JournalSerializer(source='journal_set', many=True)
    rules = RuleSerializer(source='rule_set', many=True)

    class Meta:
        model = Workspace
        fields = ('public_key', 'create_date', 'journal', 'rules')

