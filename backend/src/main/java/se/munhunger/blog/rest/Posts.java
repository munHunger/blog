package se.munhunger.blog.rest;

import javax.enterprise.context.ApplicationScoped;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.core.Response;

@ApplicationScoped
@Path("/posts")
public class Posts {

  @GET
  public Response test() {
    return Response.status(Response.Status.NOT_IMPLEMENTED).build();
  }
}
