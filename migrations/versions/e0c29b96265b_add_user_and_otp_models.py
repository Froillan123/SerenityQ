"""Add User and OTP models

Revision ID: e0c29b96265b
Revises: eadd324385e5
Create Date: 2025-04-10 18:24:45.343171

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e0c29b96265b'
down_revision = 'eadd324385e5'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('profile_picture', sa.String(length=255), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_column('profile_picture')

    # ### end Alembic commands ###
