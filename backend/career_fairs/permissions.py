from rest_framework import permissions

class IsHostUniversityOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow the host university of a career fair to edit it.
    Read-only access is allowed for any request.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the host university staff.
        if not request.user.is_authenticated or not hasattr(request.user, 'universitystaffprofile'):
            return False
            
        return obj.host_university == request.user.universitystaffprofile.university 
 
 
 
 
 
 
 
 
 
 
 