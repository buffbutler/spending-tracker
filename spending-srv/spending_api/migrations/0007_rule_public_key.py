# Generated by Django 2.0.3 on 2018-04-09 18:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('spending_api', '0006_auto_20180409_1254'),
    ]

    operations = [
        migrations.AddField(
            model_name='rule',
            name='public_key',
            field=models.CharField(max_length=200, null=True),
        ),
    ]
