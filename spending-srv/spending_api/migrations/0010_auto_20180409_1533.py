# Generated by Django 2.0.3 on 2018-04-09 21:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('spending_api', '0009_auto_20180409_1348'),
    ]

    operations = [
        migrations.AlterField(
            model_name='journal',
            name='source',
            field=models.CharField(max_length=30, null=True),
        ),
    ]
