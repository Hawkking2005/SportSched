from django.urls import path
from .views import CustomRegistrationView, VerifyEmailView

urlpatterns = [
    # ... your existing urls ...
    path('register/', CustomRegistrationView.as_view(), name='custom-registration'),
    path('verify-email/<int:user_id>/', VerifyEmailView.as_view(), name='verify-email'),
] 