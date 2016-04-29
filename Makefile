PROJECTS = \
  secu-admin-api \
  secu-admin-ui


############################
#          BUILD           #
############################

install : $(PROJECTS)

$(PROJECTS):
		$(MAKE) -C $@


############################
#          SETUP           #
############################

setup:
		for project in $(PROJECTS) ; do make -C $$project setup; done


############################
#           TEST           #
############################

test :
		for project in $(PROJECTS) ; do make -C $$project test; done


############################
#          DEPLOY          #
############################

docker-deploy :
		for project in $(PROJECTS) ; do make -C $$project docker-deploy; done


############################
#          CLEAN           #
############################

clean :
		for project in $(PROJECTS) ; do make -C $$project clean; done


.PHONY : install docker-deploy setup submodules go-deps test $(PROJECTS)
