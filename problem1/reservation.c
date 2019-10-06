#include <stdio.h>
#include <stdbool.h>

bool arePossible(int arrival[], int departure[], int n, int k)
{
	int x = 0;

	for ( int i = 0; i < n; i++)
	{
		if(departure[i] > arrival[i+1])
			x++;

		if(x > k)
			return false;
	}

	return true;
}

int main()
{
	int n, k;
	printf("Introduce reservations number ----> ");
	scanf("%d", &n);
	
	int arrival[n], departure[n];
	
	printf("Introduce arrival days ---->");
	for(int i = 0; i < n ; i++)
		scanf("%d", &arrival[i]);
	
	printf("Introduce departure days ---->");
	for(int i = 0; i < n ; i++)
		scanf("%d", &departure[i]);

	printf("Introduce available resources ----> ");
	scanf("%d", &k);
	
	printf(arePossible(arrival, departure, n, k) ? "\nNo conflicts, resources available.\n" :
												 "\nNot enough resources.\n");

	return 0; 
}