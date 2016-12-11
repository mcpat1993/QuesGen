I feel proud of of my work on the QuesGen system because it was the first time I
made a RESTful architecture. I learned about a stateless, one-page design and the 
advantages it has from a data transfer perspective but also from a design 
perspective. Not only will a request to a service pass along all information in 
the request that is necessary to correctly display the data, but you have distilled
those dependencies to information in one place. No functionalities or components 
have different design since they are all designed in house and not remotely and 
then inserted into the system by any weird div pasting.

This was also the first time that I had implemented any type of internationalization.
I am proud of how switching languages happens within the final function but also
within the independent rendering coming from every service that displays text. This 
means that you can quickly switch languages (which was eventually implemented to
only happen on login) and continue on in the language you have chosen.
