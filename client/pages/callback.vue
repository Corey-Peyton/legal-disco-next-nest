<script>
import Oidc from 'oidc-client';

new Oidc.UserManager({ response_mode: 'query' })
  .signinRedirectCallback()
  .then(() => {
    window.location = '/';
  })
  .catch(function (e) {
    console.error(e);
  });
</script>
