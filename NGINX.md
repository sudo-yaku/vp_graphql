sudo systemctl status nginx
● nginx.service - The nginx HTTP and reverse proxy server
   Loaded: loaded (/usr/lib/systemd/system/nginx.service; disabled; vendor pres>
   Active: active (running) since Tue 2025-12-30 05:47:06 CST; 1 weeks 0 days a>
  Process: 268291 ExecStart=/usr/sbin/nginx (code=exited, status=0/SUCCESS)
  Process: 268283 ExecStartPre=/usr/sbin/nginx -t (code=exited, status=0/SUCCES>
  Process: 268281 ExecStartPre=/usr/bin/rm -f /run/nginx.pid (code=exited, stat>
 Main PID: 268292 (nginx)
    Tasks: 2 (limit: 408452)
   Memory: 8.1M
   CGroup: /system.slice/nginx.service
           ├─268292 nginx: master process /usr/sbin/nginx
           └─268293 nginx: worker process

Dec 30 05:47:06 txsliopda8v systemd[1]: Starting The nginx HTTP and reverse pro>
Dec 30 05:47:06 txsliopda8v nginx[268283]: nginx: the configuration file /etc/n>
Dec 30 05:47:06 txsliopda8v nginx[268283]: nginx: configuration file /etc/nginx>
Dec 30 05:47:06 txsliopda8v systemd[1]: Started The nginx HTTP and reverse prox>


------------------------------

sudo netstat -tulnp | grep nginx
tcp        0      0 0.0.0.0:8041            0.0.0.0:*               LISTEN                                                                                   268292/nginx: maste
tcp        0      0 0.0.0.0:8045            0.0.0.0:*               LISTEN                                                                                   268292/nginx: maste
tcp        0      0 0.0.0.0:8014            0.0.0.0:*               LISTEN                                                                                   268292/nginx: maste
tcp        0      0 0.0.0.0:8015            0.0.0.0:*               LISTEN                                                                                   268292/nginx: maste
tcp        0      0 0.0.0.0:3088            0.0.0.0:*               LISTEN                                                                                   268292/nginx: maste
tcp        0      0 0.0.0.0:8052            0.0.0.0:*               LISTEN                                                                                   268292/nginx: maste
tcp        0      0 0.0.0.0:8021            0.0.0.0:*               LISTEN                                                                                   268292/nginx: maste
tcp        0      0 0.0.0.0:8024            0.0.0.0:*               LISTEN                                                                                   268292/nginx: maste
tcp        0      0 0.0.0.0:8089            0.0.0.0:*               LISTEN                                                                                   268292/nginx: maste
tcp        0      0 0.0.0.0:8026            0.0.0.0:*               LISTEN                                                                                   268292/nginx: maste
tcp        0      0 0.0.0.0:8030            0.0.0.0:*               LISTEN                                                                                   268292/nginx: maste
tcp        0      0 0.0.0.0:8032            0.0.0.0:*               LISTEN  

-------------------------------------------


/etc/nginx/nginx.conf
-bash: /etc/nginx/nginx.conf: Permission denied


/etc/nginx/conf.d/
-bash: /etc/nginx/conf.d/: Is a directory
iopadmin@txsliopda8v:/usr/apps/iop->/etc/nginx/sites-enabled/
-bash: /etc/nginx/sites-enabled/: No such file or directory


>sudo cat /etc/nginx/nginx.conf
user  nginx;
worker_processes  1;

error_log  /var/log/nginx/error.log warn;
pid        /var/run/nginx.pid;


events {
    worker_connections  1024;
}


http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    include /etc/nginx/conf.d/iop-mobile.conf;


    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
              '$status $body_bytes_sent "$http_referer" '
              '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    tcp_nopush          on;
    tcp_nodelay         on;
    keepalive_timeout   65;
    types_hash_max_size 2048;

    #gzip  on;

    #include /etc/nginx/conf.d/*.conf;





  # changes for deepika
   server {
    listen       8030;
    server_name  localhost;
    root    /usr/share/nginx/html;

    location /graphqlstaging/graphql5g{
       proxy_pass http://localhost:8027;
    }

    location /graphqlstaging/graphql4g{
     client_max_body_size 1024m;
     proxy_pass http://localhost:8037;
    }
    location /dashboard/updateRmaFromS4{
      proxy_pass http://localhost:5009/dashboard/updateRmaFromS4;
    }
     location /graphqlstaging/graphqlvideos{
              proxy_pass http://txsliopsa5v.nss.vzwnet.com:8019/;
    }

    location /vpmadmin{
        proxy_pass http://localhost:8037/vpmadmin;
    }


        location /db{
                  proxy_pass http://txsliopda4v.nss.vzwnet.com:5015/db;
                }


     error_page 404 /404.html;
        location = /40x.html {
    }

    error_page 500 502 503 504 /50x.html;
        location = /50x.html {
    }

           }


 # changes for Pavan
  server {
    listen       8041;
    server_name  localhost;
    root    /usr/share/nginx/html;
                location /graphqlstaging/graphql4g{
                 client_max_body_size 1024m;
                 proxy_pass http://localhost:8042;
                }

    location /sso/vpisso{
       proxy_pass http://txsliopda8v.nss.vzwnet.com:8086;
                }

    location /fastdashboard{
          proxy_pass http://txsliopda4v.nss.vzwnet.com:8071/fastdashboard;
    }


     error_page 404 /404.html;
        location = /40x.html {
             }
    }
# changes for Alex
  server {
    listen       8014;
    server_name  localhost;
    root    /usr/share/nginx/html;

    location /graphqlstaging/graphql4g{
     client_max_body_size 1024m;
     proxy_pass http://localhost:8013;
    }

    location /sso {
            proxy_pass http://localhost:8033;
        proxy_set_header x-vpm-origin isso;
        proxy_set_header issouserid diamonc123;
    }
    error_page 404 /404.html;
        location = /40x.html {
    }

    error_page 500 502 503 504 /50x.html;
        location = /50x.html {
    }
  }
# changes for Vijay
  server {
    listen       8032;
    server_name  localhost;
    root    /usr/share/nginx/html;

    location /graphqlstaging/graphql4g{
     client_max_body_size 1024m;
     proxy_pass http://localhost:8028;
    }

    error_page 404 /404.html;
        location = /40x.html {
    }

    error_page 500 502 503 504 /50x.html;
        location = /50x.html {
    }
  }
    # changes for veera

          server {
                listen       8015;
                server_name  localhost;
                root    /usr/share/nginx/html;


                location /graphqlstaging/graphql5g{

            proxy_pass http://localhost:8027;
                }

                location /graphqlstaging/graphql4g{
                 client_max_body_size 1024m;
                 proxy_pass http://localhost:8011;
                }
        location /rcmengine{
        proxy_pass http://txsliopda4v.nss.vzwnet.com:8046/rcmengine;
        }

        location /fastdashboard{
        proxy_pass http://txsliopda6v.nss.vzwnet.com:8006/fastdashboard;
        }

        location /user{
                proxy_pass http://txsliopda4v.nss.vzwnet.com:8003/user;
        }
        location /emis{
        proxy_pass http://localhost:5012/emis;
        }
            location /dashboard{
        proxy_pass http://txsliopda4v.nss.vzwnet.com:8049/dashboard/;
        }
                location /workorder{
        proxy_pass http://txsliopda4v.nss.vzwnet.com:8043/workorder;
        }
        location /contact{
        proxy_pass http://txsliopda4v.nss.vzwnet.com:8048/contact/;
        }

        location /client{
                 proxy_set_header X-Real-IP $remote_addr;
                 proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                 proxy_set_header Host $http_host;
                 proxy_set_header X-NginX-Proxy true;

                 proxy_pass http://txsliopda8v.nss.vzwnet.com:8021/client/;
                 proxy_redirect off;

                 proxy_buffers 8 32k;
                 proxy_buffer_size 64k;

                 proxy_http_version 1.1;
                 proxy_set_header Upgrade $http_upgrade;
                 proxy_set_header Connection "upgrade";

        }



        location /sso/client{
                 proxy_set_header X-Real-IP $remote_addr;
                 proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                 proxy_set_header Host $http_host;
                 proxy_set_header X-NginX-Proxy true;

                 proxy_pass http://txsliopda7v.nss.vzwnet.com:8021/client/;
                 proxy_redirect off;

                 proxy_buffers 8 32k;
                 proxy_buffer_size 64k;

                 proxy_http_version 1.1;
                 proxy_set_header Upgrade $http_upgrade;
                 proxy_set_header Connection "upgrade";
                }

                location /graphqlstaging/graphqlvideos{
                   proxy_pass http://txsliopsa5v.nss.vzwnet.com:8019/;
                }

         location /network{
                proxy_pass http://localhost:8023;
                client_max_body_size 1024m;

        }


        location /vppm{
                   proxy_pass http://txsliopda7v.nss.vzwnet.com:8018/vppm;
        }
        location /sso {
                proxy_pass http://localhost:8023;
            proxy_set_header x-vpm-origin isso;
            proxy_set_header issouserid testvp456;
        }
                 error_page 404 /404.html;
                    location = /40x.html {
                }


                error_page 500 502 503 504 /50x.html;
                    location = /50x.html {
                }
            }

    # changes for shashank
  server {
    listen       8089;
    server_name  localhost;
    root    /usr/share/nginx/html;

    location /graphqlstaging/graphql5g{
     proxy_pass http://localhost:8027;
    }

    location /graphqlstaging/graphql4g{
     client_max_body_size 1024m;
     proxy_pass http://localhost:8022;
    }


     error_page 404 /404.html;
        location = /40x.html {
    }

    error_page 500 502 503 504 /50x.html;
        location = /50x.html {
    }
    }

# changes for Nitin
  server {
    listen       8052;
    server_name  localhost;
    root    /usr/share/nginx/html;

    location /graphqlstaging/graphql5g{
       proxy_pass http://localhost:8053;
    }

    location /graphqlstaging/graphql4g{
       proxy_pass http://localhost:8054;
    }

    location /vppm{
       proxy_pass http://txsliopda7v.nss.vzwnet.com:8018/vppm/;
    }

    location /sectorlock{
       proxy_pass http://txsliopda7v.nss.vzwnet.com:8018/sectorlock/;
    }

    location /workorder{
       proxy_pass http://txsliopda7v.nss.vzwnet.com:8018/workorder/;
    }

    location /genrun{
       proxy_pass http://txsliopda7v.nss.vzwnet.com:8018/genrun/;
    }

    location /devieTest{
      proxy_pass http://txsliopda7v.nss.vzwnet.com:8018/deviceTest/;
    }

    location /vendoruser{
      proxy_pass http://txsliopda6v.nss.vzwnet.com:8017/vendoruser/;
    }

    location /fuzePoSync{
      proxy_pass http://txsliopda7v.nss.vzwnet.com:8033/fuzePoSync/;
    }
    location /esa{
          proxy_pass http://txsliopda7v.nss.vzwnet.com:8025/esa/;
        }
    location /sso/vpisso/v1{
      proxy_pass http://txsliopda6v.nss.vzwnet.com:8086/sso/vpisso/v1/;
    }

     error_page 404 /404.html;
        location = /40x.html {
    }

    error_page 500 502 503 504 /50x.html;
        location = /50x.html {
    }
    }

#change for Alekhya
  server {
    listen       8045;
    server_name  localhost;
    root    /usr/share/nginx/html;

    location /vppm{
           proxy_pass http://txsliopda4v.nss.vzwnet.com:8034/scrub/vppm/;
        }

    location /graphqlstaging/graphql4g{
       proxy_pass http://localhost:8028;
    }

    location /graphqlstaging/graphqlvideos{
           proxy_pass http://txsliopsa5v.nss.vzwnet.com:8019/;
        }

    location /{
       proxy_pass http://txsliopda4v.nss.vzwnet.com:8034/scrub/;
    }

    error_page 404 /404.html;
       location = /40x.html {
    }

    error_page 500 502 503 504 /50x.html;
       location = /50x.html {
   }
}

#Changes for Adarsh
server {
                listen       8026;
                server_name  localhost;
                root    /usr/share/nginx/html;

                #location /graphqlstaging/graphql4g{
                # client_max_body_size 1024m;
                # proxy_pass http://localhost:8061;
                #}

                #location /graphqlstaging/graphqlvideos{
                  # proxy_pass http://txsliopsa5v.nss.vzwnet.com:8019/;
                #}

                location /{
                        client_max_body_size 1024m;
                        proxy_pass http://localhost:8080/;
                }

                 error_page 404 /404.html;
                    location = /40x.html {
                }


                error_page 500 502 503 504 /50x.html;
                    location = /50x.html {
                }
}

#Changes for Abhay
server {
                listen       8021;
                server_name  localhost;
                root    /usr/share/nginx/html;

                location /graphqlstaging/graphql4g{
                 client_max_body_size 1024m;
                 proxy_pass http://localhost:8063;
                }

                location /graphqlstaging/graphqlvideos{
                   proxy_pass http://txsliopsa5v.nss.vzwnet.com:8019/;
                }

                 error_page 404 /404.html;
                    location = /40x.html {
                }


                error_page 500 502 503 504 /50x.html;
                    location = /50x.html {
                }
}


#Changes for Murali
server {
                listen       8024;
                server_name  localhost;
                root    /usr/share/nginx/html;

                location /graphql/iop-mobile{
                 client_max_body_size 1024m;
                 proxy_pass http://localhost:8009;
                }

                 error_page 404 /404.html;
                    location = /40x.html {
                }


                error_page 500 502 503 504 /50x.html;
                    location = /50x.html {
                }
}



}



http://txsliopda8v.nss.vzwnet.com:8024/graphql/iop-mobile

sudo su - iopadmin (da8v)
Again enter vz password





