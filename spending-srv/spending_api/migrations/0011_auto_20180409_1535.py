# Generated by Django 2.0.3 on 2018-04-09 21:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('spending_api', '0010_auto_20180409_1533'),
    ]

    operations = [
        migrations.AlterField(
            model_name='journal',
            name='source',
            field=models.CharField(default=None, max_length=30, null=True),
        ),
    ]
