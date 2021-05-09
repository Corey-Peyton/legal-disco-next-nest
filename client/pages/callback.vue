<script>
import Oidc from 'oidc-client';

debugger;

new Oidc.UserManager({ response_mode: 'query' })
  .signinRedirectCallback()
  .then(() => {
    debugger;
    window.location = '/';
  })
  .catch(function (e) {
        debugger;
    console.error(e);
  });
</script>
